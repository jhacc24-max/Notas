import asyncio,base64,sys,os,subprocess,time
from playwright.async_api import async_playwright
out=sys.argv[1]; only=sys.argv[2].split(',') if len(sys.argv)>2 and sys.argv[2] else None
os.makedirs(out,exist_ok=True)
async def main():
  srv=subprocess.Popen(['python3','-m','http.server','8765'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  try:
    async with async_playwright() as p:
      b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
      pg=await b.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
      await pg.goto('http://localhost:8765/render.html');await pg.wait_for_function('window.READY',timeout=60000)
      ids=await pg.evaluate('MODEL_IDS')
      for i in ids:
        if only and i not in only: continue
        try:
          u=await pg.evaluate(f'renderModel({i!r})')
          open(f'{out}/{i}.png','wb').write(base64.b64decode(u.split(',')[1]))
        except Exception as e: print('ERR',i,str(e)[:200])
      print('errs',errs[:5])
      await b.close()
  finally: srv.kill()
asyncio.run(main())
