---
sidebar_position: 2
---
# Installation
<div style={{position: "relative", paddingBottom: "64.86%", height: 0}}><iframe src="https://www.loom.com/embed/dee1ca6f7d294ef2b7f2746243e67e41?sid=256e5a97-215e-46fa-974e-69b329096273" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

### Requirements
Before installing the nudgebee Server, make sure you have the following prerequisites:

- Installed `kubectl` command-line tool.
- Have a kubeconfig file (default location is `~/.kube/config`).
- Have an active connection to the desired cluster.
- Install [Helm](https://helm.sh/docs/intro/install/).
- Nudgebee License Keys

### Installation Steps
Follow these steps to install the nudgebee server using Helm:

#### Helm Registry Login
```shell
helm registry login https://registry.nudgebee.com --username nudgebee --password $NUDGEBEE_LICENSE_KEY
```

#### Install Nudgebee
To install latest nudgebee version 
```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

If you want to install specific version of nudgebee then please use below helm command
```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee --version $CHART_VERSION -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

##### Sample Values File

Below values file is based on cert-manager managed SSL. These can be adjusted based on cluster specific implementation.
For more details on other possible configurations, please refer values.yaml file


```yaml
global:
  image:
    registry: "registry.nudgebee.com"
  imagePullSecrets:
    - name: nudgebee-registry-secret

nudgebee_registry_secret:
  enabled: true


nudgebee_secret:
  BASE_URL: "<Nudgebee Server Https Url>"
  NUDGEBEE_LICENSE: <UR License Key>
  NEXTAUTH_DUMMY_CREDS_ENABLED: true

app:
  ingress:
    enabled: true
    hosts:
      - host: "<Nudgebee Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<Nudgebee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
k8s-collector:
  ingress:
    enabled: false
    hosts:
      - host: "<Nudgebee collector Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<Nudgebee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
relay-server:
  ingress:
    enabled: false
    hosts:
      - host: "<Nudgebee relay Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<Nudgebee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```

#### Uninstall Nudgebee

```shell
helm uninstall nudgebee  --namespace nudgebee --kube-context $KUBE_CONTEXT
```


