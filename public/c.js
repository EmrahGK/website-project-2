// --- NOT SITE CODE ---

if(window.__ZortURL === undefined) {
    console.warn("[Zort] URL IS UNDEFINED");
    let params = (new URL(document.location)).searchParams;
    let origin = params.get("url");
    window.__ZortURL = origin;
  };
  
  ((url)=>{
    let { origin } = new URL(url);
    let _fetch = window.fetch;
    let zortFetch = (resource, init) => {
      if(!resource.startsWith("https")) {
        resource = `https://mebzort.glitch.me/?url=${origin}${resource}`;
      } else {
        resource = `https://mebzort.glitch.me/?url=${resource}`;
      };
      console.log(`[Zort.fetch] ::${resource}`, init);
      return _fetch(resource, init);
    };
    
    window.fetch = zortFetch;
  })(window.__ZortURL);