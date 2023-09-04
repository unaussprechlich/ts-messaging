# ts-messaging

A opinionated framework for type consistency in messaging stacks with a focus on developer experience.

The documentation can be found [here](https://unaussprechlich.github.io/ts-messaging).

## Setup
`pnpm install`

## Appendix: Install Confluent Platform
```bash
#Create the namespace to use.
kubectl create namespace confluent

#Set this namespace to default for your Kubernetes context.
kubectl config set-context --current --namespace confluent

#Add the Confluent for Kubernetes Helm repository.
helm repo add confluentinc https://packages.confluent.io/helm
helm repo update

#Install Confluent for Kubernetes.
helm upgrade --install confluent-operator confluentinc/confluent-for-kubernetes

#Install all Confluent Platform components.
kubectl apply -f https://raw.githubusercontent.com/confluentinc/confluent-kubernetes-examples/master/quickstart-deploy/confluent-platform-singlenode.yaml

#Install a sample producer app and topic.
kubectl apply -f https://raw.githubusercontent.com/confluentinc/confluent-kubernetes-examples/master/quickstart-deploy/producer-app-data-singlenode.yaml

#Check that everything is deployed:
kubectl get pods
```

#### Expose with port forwarding:
```bash
#Set up port forwarding to Control Center web UI from local machine to localhost:9021
kubectl port-forward controlcenter-0 9021:9021
```

#### To expose kafka and the schemaregistry with a loadbalancer see:
`/.kubernetes/service-kafka-localhost.yml`
`/.kubernetes/service-schemaregistry-localhost.yml`
