import InstallApp from "@/components/site/install-app";
export const metadata={title:"تثبيت التطبيق — SHARE FAST",description:"ثبّت تطبيق SHARE FAST للمندوب والنشاط التجاري وشركة التوصيل."};
export default async function AppPage({searchParams}:{searchParams:Promise<{role?:string;launch?:string}>}) {
 const {role,launch}=await searchParams;
 return <InstallApp autoOpen={launch==="installed"} initialRole={role==="company"?"company":role==="merchant"?"merchant":"courier"}/>;
}
