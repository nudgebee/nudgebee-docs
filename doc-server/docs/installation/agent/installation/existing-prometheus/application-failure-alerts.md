# Add Prometheus ScrapeConfig and additional rules

If Prometheus is already installed, add the scrapeConfig using the preferred means for your Prometheus installation. 

If installed using helm then below command can be used

```shell
 helm upgrade $name prometheus-community/kube-prometheus-stack -n $namespace -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
```
