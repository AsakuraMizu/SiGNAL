import sibot
import yaml

with open('config.yaml') as f:
    conf = yaml.safe_load(f.read())

sibot.init(conf)


if __name__ == '__main__':
    sibot.run()
