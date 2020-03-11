# src of SiGNAL酱

## setup

**We suggest to use virtualenv. If u decide to use it, plz refer to the document of virtualenv.**

Modify the variables in `docker-compose.yml` as u like, and update part `CoolQ` of `config.py` synchronously.  
Then type `docker-compose up -d` in your terminal.
Open [http://127.0.0.1:9000](http://127.0.0.1:9000) in your browser and follow the steps to login your bot's QQ.

Install Redis if u have not. Remember to update part `Redis` of `config.py`.

Install the requirements in 'requirements.txt' by `pip install -r requirements.txt`.

Modify the variables in part `General` of `config.py` freely.

Then just run `bot.py`.