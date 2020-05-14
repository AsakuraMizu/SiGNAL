import sibot
import yaml

with open('config.yaml') as f:
    conf = yaml.safe_load(f.read())

sibot.init(conf)

app = sibot.get_bot().app


@app.route('/test')
async def _():
    session = sibot.CommandSession(sibot.get_bot(), sibot.Event({
        'type': 'GroupMessage',
        'sender': {
            'id': 2677294549,
            'group': {'id': 785943614}
        }
    }), '?', 'oeis', sibot.MessageChain('1,2,5,7,8,11'))
    await sibot.get_bot().cmd.call_command('oeis', session)
    return '', 204


if __name__ == '__main__':
    sibot.run()
