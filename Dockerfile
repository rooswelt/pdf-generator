FROM digitalkreativ/docker-php7.1-fpm-puppeteer

# Copy the app
COPY . /app/

WORKDIR /app
RUN npm i

# # Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser ./node_modules

# Run everything after as non-privileged user.
USER pptruser

EXPOSE 3000

CMD ["npm", "run", "start"]
