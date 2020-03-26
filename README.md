# SiGNAL bot

## Usage

### First, you have to configure it

```bash
cp .env.sample .env
cp config.sample.py config.py
```

Edit these two files as you like.

### Start

```bash
docker-compose up -d
```

That's all.

## Note

I have configure `Pipfile` and `Dockerfile` suitable for Chinese users. If you are not in mainland China, you need to reconfigure these two files manually. Don't forget to use `pipenv lock`.