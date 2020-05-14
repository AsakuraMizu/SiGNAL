FROM python

RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD python bot.py
