FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Use port 8080 by default
ENV PORT=8080
ENV UPSTREAM_URL=http://localhost:80
ENV AUTH_CACHE_VALID=5m

# Substitute variables and run nginx
# We explicitly list variables to substitute so that Nginx variables (starting with $) are preserved
CMD ["/bin/sh", "-c", "envsubst '$PORT $UPSTREAM_URL $AUTH_URL $LOGIN_URL $AUTH_CACHE_VALID' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
