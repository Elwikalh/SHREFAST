import {describe,it,expect} from "vitest";
import {registrationSchema} from "../lib/wasl-auth-schema";
const basic={name:"حساب الاختبار",phone:"+20 1000000101",password:"secure-password-42",governorate:"القاهرة",zone:"المعادي",consent:true};
describe("minimal role-specific registration",()=>{
 it("requires merchant pickup address",()=>{expect(registrationSchema.safeParse({...basic,role:"merchant"}).success).toBe(false);expect(registrationSchema.safeParse({...basic,role:"merchant",address:"عنوان الاستلام"}).success).toBe(true)});
 for(const role of ["company","courier"])it(`${role} does not require operating details or identity documents`,()=>{const value=registrationSchema.parse({...basic,role});expect(value.address).toBe("");expect(value.coverage).toEqual([]);expect(value.nationalId).toBeUndefined();expect(value.phone).toBe("01000000101")});
 it("does not weaken phone, password or consent validation",()=>{for(const change of [{phone:"123"},{password:"123456"},{consent:false}])expect(registrationSchema.safeParse({...basic,role:"courier",...change}).success).toBe(false)});
});
