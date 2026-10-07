import type {Metadata} from 'next'
import {loadCosting} from './actions'
import {CostingPanel} from './costing-panel'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'حساب تكلفة الدفعات | الحَبّوب',robots:{index:false,follow:false}}
export default async function CostingPage(){const initial=await loadCosting();return <CostingPanel initial={initial}/>}
