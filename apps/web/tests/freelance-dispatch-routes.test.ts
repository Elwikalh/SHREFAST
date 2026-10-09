import { beforeEach, expect, it, vi } from "vitest";
const f=vi.hoisted(()=>({authorize:vi.fn(),read:vi.fn(),save:vi.fn(),offers:vi.fn(),claim:vi.fn()}));
vi.mock("@/lib/wasl-access",()=>({authorizeWasl:f.authorize}));
vi.mock("@/lib/freelance-dispatch",async(original)=>{
  const actual=await original<Record<string,unknown>>();
  return {...actual,readDispatchSetting:f.read,saveDispatchSetting:f.save,freelanceOffers:f.offers,claimFreelanceOffer:f.claim};
});
import {GET as settingsGET,POST as settingsPOST} from "../app/api/wasl/freelance/settings/route";
import {GET as offersGET} from "../app/api/wasl/freelance/offers/route";
import {POST as claimPOST} from "../app/api/wasl/freelance/claim/route";
import {parseDispatchClaim,parseDispatchSetting,DispatchError} from "../lib/freelance-dispatch";
const courier={id:"server-id",ref:"CRX-1",role:"courier"};
const request=(path:string,body?:string)=>new Request("https://test.invalid/api/wasl/freelance/"+path,{
  method:body===undefined?"GET":"POST",headers:{Origin:"https://test.invalid","Content-Type":"application/json"},
  ...(body===undefined?{}:{body})
});
beforeEach(()=>{
  vi.clearAllMocks();f.authorize.mockResolvedValue(courier);f.read.mockResolvedValue({enabled:false,revision:0});
  f.save.mockImplementation(async(_user,value)=>({...parseDispatchSetting(value),revision:1}));
  f.offers.mockResolvedValue({available:true,busy:false,offers:[]});
  f.claim.mockImplementation(async(_user,value)=>({ref:parseDispatchClaim(value),status:"accepted",replayed:false}));
});
it("requires the existing authentication/origin gate for every route",async()=>{
  f.authorize.mockResolvedValue(Response.json({error:"authentication_required"},{status:401}));
  expect((await settingsGET(request("settings"))).status).toBe(401);
  expect((await settingsPOST(request("settings",'{"enabled":true,"expectedRevision":0}'))).status).toBe(401);
  expect((await offersGET(request("offers"))).status).toBe(401);
  expect((await claimPOST(request("claim",'{"orderRef":"SX-1"}'))).status).toBe(401);
  expect(f.claim).not.toHaveBeenCalled();expect(f.save).not.toHaveBeenCalled();expect(f.offers).not.toHaveBeenCalled();
});
it("preserves an origin rejection before mutation",async()=>{
  f.authorize.mockResolvedValue(Response.json({error:"invalid_origin"},{status:403}));
  expect((await claimPOST(request("claim",'{"orderRef":"SX-1"}'))).status).toBe(403);
  expect(f.claim).not.toHaveBeenCalled();
});
it("allows only merchants or couriers to control their own settings",async()=>{
  for(const role of ["admin","company"]){
    f.authorize.mockResolvedValue({...courier,role});
    expect((await settingsGET(request("settings"))).status).toBe(403);
    expect((await settingsPOST(request("settings",'{"enabled":true,"expectedRevision":0}'))).status).toBe(403);
  }
  expect(f.save).not.toHaveBeenCalled();
});
it("only couriers can list and claim independent jobs",async()=>{
  for(const role of ["merchant","company","admin"]){
    f.authorize.mockResolvedValue({...courier,role});
    expect((await offersGET(request("offers"))).status).toBe(403);
    expect((await claimPOST(request("claim",'{"orderRef":"SX-1"}'))).status).toBe(403);
  }
  expect(f.claim).not.toHaveBeenCalled();expect(f.offers).not.toHaveBeenCalled();
});
it("rejects query identity/location overrides on reads and writes",async()=>{
  expect((await offersGET(request("offers?zone=القاهرة"))).status).toBe(400);
  expect((await settingsGET(request("settings?ref=other"))).status).toBe(400);
  expect((await settingsPOST(request("settings?accountId=other",'{"enabled":true,"expectedRevision":0}'))).status).toBe(400);
  expect((await claimPOST(request("claim?courierRef=other",'{"orderRef":"SX-1"}'))).status).toBe(400);
});
it("passes only the server principal and enforces strict claim body",async()=>{
  expect((await claimPOST(request("claim",'{"orderRef":"SX-1","courierRef":"CRX-2"}'))).status).toBe(400);
  const r=await claimPOST(request("claim",'{"orderRef":"SX-1"}'));expect(r.status).toBe(200);
  expect(f.claim).toHaveBeenLastCalledWith(courier,{orderRef:"SX-1"});
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(await r.json()).toMatchObject({ok:true,claim:{ref:"SX-1",status:"accepted"}});
});
it("does not silently discard extra setting or pricing fields",async()=>{
  for(const extra of [{merchantRef:"SX-2"},{courierRef:"CRX-2"},{monthlyFee:0},{priority:true}])
    expect((await settingsPOST(request("settings",JSON.stringify({enabled:true,expectedRevision:0,...extra})))).status).toBe(400);
});
it("maps confirmed conflicts separately from ambiguous service failure",async()=>{
  f.claim.mockRejectedValueOnce(new DispatchError("courier_busy"));
  expect((await claimPOST(request("claim",'{"orderRef":"SX-1"}'))).status).toBe(409);
  f.claim.mockRejectedValueOnce(Error("private customer phone SQL secret"));
  const r=await claimPOST(request("claim",'{"orderRef":"SX-1"}'));expect(r.status).toBe(503);
  expect(await r.text()).not.toMatch(/private|phone|SQL|secret/);
});
it("rejects malformed and oversized body without leaking source errors",async()=>{
  expect((await claimPOST(request("claim","{"))).status).toBe(400);
  expect((await settingsPOST(request("settings",'{"enabled":'+ " ".repeat(70000)+"true}"))).status).toBe(400);
});
it("returns no-store setting/offer reads and no full order data in claim response",async()=>{
  for(const handler of [settingsGET,offersGET]){
    const r=await handler(request("settings"));expect(r.status).toBe(200);expect(r.headers.get("cache-control")).toBe("no-store");
  }
  const r=await claimPOST(request("claim",'{"orderRef":"SX-1"}'));
  expect(await r.text()).not.toMatch(/customerPhone|customerName|toAddr|fromAddr|payment/);
});