// Original, synthesised soundscape. No external recording or music request.
export class Soundscape {
  constructor(){this.enabled=false;this.ctx=null;this.timer=null;}
  async toggle(){
    if(!this.ctx){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return false;
      this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=0;this.master.connect(this.ctx.destination);
      const data=this.ctx.createBuffer(1,this.ctx.sampleRate*3,this.ctx.sampleRate);const values=data.getChannelData(0);let last=0;
      for(let i=0;i<values.length;i++){last=(last+(Math.random()*2-1)*.014)/1.014;values[i]=last;}
      const source=this.ctx.createBufferSource();source.buffer=data;source.loop=true;
      const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=550;
      const volume=this.ctx.createGain();volume.gain.value=.45;source.connect(filter).connect(volume).connect(this.master);source.start();
      this.timer=setInterval(()=>{if(this.enabled){this.chime([392,440,523.25,587.33,659.25][Math.floor(Math.random()*5)],.023);}},5000);
    }
    await this.ctx.resume();this.enabled=!this.enabled;this.master.gain.setTargetAtTime(this.enabled?.5:0,this.ctx.currentTime,.3);return this.enabled;
  }
  chime(frequency=523.25,volume=.06){
    if(!this.enabled||!this.ctx)return;
    const t=this.ctx.currentTime,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+3.5);osc.connect(gain).connect(this.master);osc.start(t);osc.stop(t+3.6);
  }
  step(){if(this.enabled&&Math.random()>.55)this.chime(100+Math.random()*40,.013);}
}
