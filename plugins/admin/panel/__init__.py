import nonebot


app = nonebot.get_bot().server_app

@app.route('/admin')
async def admin():
  
  pass