// Restrict the legacy portal change to the single server-backed availability control and embedded offers.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
test("legacy portal remains byte-identical outside the reviewed single-switch UI adapters",()=>{
 let s=readFileSync(new URL("../components/wasl/portal.jsx",import.meta.url),"utf8");
 assert.equal(s.split("\t\t\t\t\t\t\t\t\t\t\tclassName: \"tgl\",\n\t\t\t\t\t\t\t\t\t\t\trole: \"switch\",\n\t\t\t\t\t\t\t\t\t\t\t\"aria-label\": \"متاح للعمل\",\n\t\t\t\t\t\t\t\t\t\t\t\"aria-checked\": t,\n\t\t\t\t\t\t\t\t\t\t\tdisabled: !e.courierCanToggle,\n").length,2);
 s=s.replace("\t\t\t\t\t\t\t\t\t\t\tclassName: \"tgl\",\n\t\t\t\t\t\t\t\t\t\t\trole: \"switch\",\n\t\t\t\t\t\t\t\t\t\t\t\"aria-label\": \"متاح للعمل\",\n\t\t\t\t\t\t\t\t\t\t\t\"aria-checked\": t,\n\t\t\t\t\t\t\t\t\t\t\tdisabled: !e.courierCanToggle,\n","\t\t\t\t\t\t\t\t\t\t\tclassName: \"tgl\",\n");
 assert.equal(s.split("\t\t\t\t\t\tchildren: [\n\t\t\t\t\t\t\tIa === \"home\" && e.courierOfferContent,\n").length,2);
 s=s.replace("\t\t\t\t\t\tchildren: [\n\t\t\t\t\t\t\tIa === \"home\" && e.courierOfferContent,\n","\t\t\t\t\t\tchildren: [\n");
 assert.equal(s.split("\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tchildren: \"استقبال الطلبات مفعّل\",\n").length,2);
 s=s.replace("\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tchildren: \"استقبال الطلبات مفعّل\",\n","\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tchildren: \"أنت جاهز للعمل\",\n");
 assert.equal(s.split("\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\"العروض المناسبة تظهر هنا وتتحدث كل 15 ثانية أثناء فتح التطبيق. قبول الطلب يحتاج تأكيد الخادم.\",\n").length,2);
 s=s.replace("\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\"العروض المناسبة تظهر هنا وتتحدث كل 15 ثانية أثناء فتح التطبيق. قبول الطلب يحتاج تأكيد الخادم.\",\n","\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\"الطلبات المتاحة في الشبكة تظهر هنا فورًا — أول من يقبل ياخد الطلب.\",\n");
 assert.equal(s.split("function L2({ principal, courierNetwork }) {\n").length,2);
 s=s.replace("function L2({ principal, courierNetwork }) {\n","function L2({ principal }) {\n");
 assert.equal(s.split("\t\tcourierOn: courierNetwork ? courierNetwork.online : I,\n\t\tsetCourierOn: courierNetwork ? courierNetwork.setOnline : h,\n\t\tcourierCanToggle: courierNetwork ? courierNetwork.canToggle : true,\n\t\tcourierOfferContent: courierNetwork?.content,\n").length,2);
 s=s.replace("\t\tcourierOn: courierNetwork ? courierNetwork.online : I,\n\t\tsetCourierOn: courierNetwork ? courierNetwork.setOnline : h,\n\t\tcourierCanToggle: courierNetwork ? courierNetwork.canToggle : true,\n\t\tcourierOfferContent: courierNetwork?.content,\n","\t\tcourierOn: I,\n\t\tsetCourierOn: h,\n");
 assert.equal(s.split("/** @param {{principal: any, courierNetwork?: import(\"./freelance-dispatch-panel\").CourierNetworkView}} props */\nexport default function WaslPortal({ principal, courierNetwork }) {\n\treturn jsxRuntime.jsx(Xm, { children: jsxRuntime.jsx(L2, { principal, courierNetwork }) });\n").length,2);
 s=s.replace("/** @param {{principal: any, courierNetwork?: import(\"./freelance-dispatch-panel\").CourierNetworkView}} props */\nexport default function WaslPortal({ principal, courierNetwork }) {\n\treturn jsxRuntime.jsx(Xm, { children: jsxRuntime.jsx(L2, { principal, courierNetwork }) });\n","export default function WaslPortal({ principal }) {\n\treturn jsxRuntime.jsx(Xm, { children: jsxRuntime.jsx(L2, { principal }) });\n");
 const hash=createHash("sha1").update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest("hex");
 assert.equal(hash,"6ebbbcb87ec3fe0587280a00c79f93c41e909e94");
});
