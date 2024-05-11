pipeline {
    agent any
    stages{
        agent { label 'copper' }
        stage('Clone App'){
            steps{
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-credentials-copper', url: 'https://github.com/Benuka-Punchihewa/herbal-app-product-service.git']]])
            }
        }

        stage('Build docker images'){
            agent { label 'copper' }
            steps{
                script{
                    dockerImage = docker.build("benukapunchihewa/product-service:latest")
                }
            }
        }
        stage('Push image to Hub'){
            agent { label 'copper' }
            steps{
                script{
                   withDockerRegistry([ credentialsId: "dockerHub", url: "" ]) {
                    dockerImage.push()
                    }
                }
            }
        }
        stage('Deploy to k8s') {
            agent { label 'zink' }
            steps {
                script {
                    withKubeConfig([credentialsId: 'google-cloud-service-account', serverUrl: 'https://104.196.35.11']) {
                        dir('kubernetes_config') {
                            sh 'kubectl apply -f product-config.yaml'
                            sh 'kubectl apply -f product.yaml'
                        }
                    }
                }
            }
        }
    }
}