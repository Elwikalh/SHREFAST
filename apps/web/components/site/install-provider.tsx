"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{outcome: "accepted" | "dismissed"}> };
type InstallState = { installed: boolean; available: boolean; installing: boolean; install: () => Promise<void> };
const Context = createContext<InstallState>({ installed:false, available:false, installing:false, install:async()=>{} });
export const useInstall = () => useContext(Context);
export default function InstallProvider({children}:{children:ReactNode}) {
 const [deferred,setDeferred] = useState<InstallEvent|null>(null);
 const [installed,setInstalled] = useState(false);
 const [installing,setInstalling] = useState(false);
 useEffect(()=>{
  const media=window.matchMedia("(display-mode: standalone)");
  const refresh=()=>setInstalled(media.matches || !!(navigator as Navigator & {standalone?:boolean}).standalone);
  const ready=(event:Event)=>{event.preventDefault();setDeferred(event as InstallEvent)};
  const complete=()=>{setDeferred(null);setInstalled(true)};
  refresh(); media.addEventListener("change",refresh);
  window.addEventListener("beforeinstallprompt",ready); window.addEventListener("appinstalled",complete);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});
  return()=>{media.removeEventListener("change",refresh);window.removeEventListener("beforeinstallprompt",ready);window.removeEventListener("appinstalled",complete)};
 },[]);
 async function install(){
  if(!deferred || installing)return;
  setInstalling(true);
  try{await deferred.prompt();const choice=await deferred.userChoice;setDeferred(null);if(choice.outcome==="accepted")setInstalled(true)}
  catch{setDeferred(null)}finally{setInstalling(false)}
 }
 return <Context.Provider value={{installed,available:!!deferred,installing,install}}>{children}</Context.Provider>;
}
