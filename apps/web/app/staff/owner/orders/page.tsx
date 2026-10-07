import type {Metadata} from 'next'
import {loadOperatingBoard} from './actions'
import {loadOperatingCatalog} from './manual'
import {OperationsPanel} from './operations-panel'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'شاشة شغلي | الحَبّوب',robots:{index:false,follow:false}}
export default async function OwnerOrdersPage(){const[initial,catalog]=await Promise.all([loadOperatingBoard(),loadOperatingCatalog()]);return <OperationsPanel initial={initial} catalog={catalog}/>}
