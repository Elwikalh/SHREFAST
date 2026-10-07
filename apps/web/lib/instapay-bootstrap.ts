import {db,siteSettings} from '@el7bboB/db'
import {INSTAPAY_ADDRESS} from './instapay-provided'
let ready:Promise<void>|undefined
// One-time application of the owner's explicitly supplied payment destination.
// The marker and account update commit together. Later admin changes/disabling are preserved.
export async function ensureProvidedInstapay(){if(!ready)ready=db.transaction(async tx=>{const inserted=await tx.insert(siteSettings).values({id:'instapay-owner-setup-20261003'}).onConflictDoNothing().returning({id:siteSettings.id});if(inserted.length)await tx.insert(siteSettings).values({id:'default',instapayAddress:INSTAPAY_ADDRESS,instapayWalletNumber:null,instapayAccountName:null}).onConflictDoUpdate({target:siteSettings.id,set:{instapayAddress:INSTAPAY_ADDRESS,instapayWalletNumber:null,instapayAccountName:null,updatedAt:new Date()}})}).then(()=>{}).catch(error=>{ready=undefined;throw error});await ready}
