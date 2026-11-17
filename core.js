(function(root){
  const DURATION=180000;
  function remaining(state,now){return Math.max(0,Math.min(DURATION,state.mode==='running'?state.deadline-now:state.remaining));}
  function start(now){return {mode:'running',deadline:now+DURATION,remaining:DURATION};}
  function flip(state,now){
    const left=remaining(state,now);
    if(state.mode!=='running'||left<=0)return {...state,mode:left<=0?'expired':state.mode};
    const next=DURATION-left;
    return {mode:next>0?'running':'expired',deadline:now+next,remaining:next};
  }
  function fill(fraction){
    const f=Math.max(0,Math.min(1,fraction)),slope=164/140,area=13720;
    const topHeight=2*f*area/(16+Math.sqrt(256+2*slope*f*area));
    const bottomHeight=2*(1-f)*area/(180+Math.sqrt(32400-2*slope*(1-f)*area));
    return {topY:205-topHeight,topHeight,bottomY:375-bottomHeight,bottomHeight};
  }
  const api={DURATION,remaining,start,flip,fill};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ArenaCore=api;
})(globalThis);
