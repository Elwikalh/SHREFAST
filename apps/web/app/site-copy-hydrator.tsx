"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

type Pair={sources:readonly string[];value:string}
export function SiteCopyHydrator(){
	const pathname=usePathname()
	useEffect(()=>{
		if(pathname.startsWith("/staff"))return
		let observer:MutationObserver|undefined,active=true
		fetch("/api/site-copy",{cache:"no-store"}).then((response)=>response.ok?response.json():Promise.reject()).then((data:{pairs:Pair[]})=>{
			if(!active)return
			const replacements=new Map<string,string>();for(const pair of data.pairs)for(const source of pair.sources)replacements.set(source,pair.value)
			const apply=(root:Node)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;while((node=walker.nextNode())){const raw=node.nodeValue??"",trimmed=raw.trim(),replacement=replacements.get(trimmed);if(replacement&&replacement!==trimmed)node.nodeValue=raw.replace(trimmed,replacement)}if(root instanceof Element){for(const element of [root,...Array.from(root.querySelectorAll("[placeholder],[title],[aria-label]"))])for(const attribute of ["placeholder","title","aria-label"]){const value=element.getAttribute(attribute),replacement=value?replacements.get(value):undefined;if(replacement)element.setAttribute(attribute,replacement)}}}
			apply(document.body);observer=new MutationObserver((mutations)=>{for(const mutation of mutations)for(const node of Array.from(mutation.addedNodes))apply(node)});observer.observe(document.body,{childList:true,subtree:true})
		}).catch(()=>undefined)
		return()=>{active=false;observer?.disconnect()}
	},[pathname])
	return null
}
