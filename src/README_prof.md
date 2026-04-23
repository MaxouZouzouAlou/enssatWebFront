# Projet Git Local'zh

## Pré-requis

Npm est nécessaire pour éxécuter le projet, il faut donc l'installer s'il ne l'est pas déjà :

### Windows :

- Suivez le tutoriel d'installation de node sur le site officiel [nodejs.org](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) et téléchargez la version LTS (Long-Term Support) pour Windows (fichier .msi).
- Exécutez le fichier téléchargé et suivez l'assistant d'installation en acceptant les paramètres par défaut, en veillant à ce que l'option npm package manager soit bien cochée. 
- Une fois l'installation terminée, ouvrez une invite de commande (PowerShell ou CMD) et vérifiez l'installation avec les commandes node -v et npm -v


### Linux :
```bash
sudo apt update
sudo apt install nodejs npm
```


## Installation côté Front

Si besoin, on peut cloner le projet avec :

### HTTPS :
```bash
git clone https://github.com/MaxouZouzouAlou/enssatWebFront.git
```

### SSH :
```bash
git clone git@github.com:MaxouZouzouAlou/enssatWebFront.git
```

Pour installer les dépendances :
### 
```bash
npm install
```


## Exécution

Avant d'exécuter la partie Front, il est nécessaire d'avoir effectuer le setup décrit dans le README du Back.

Si le setup est effectué, lancez la commande :
```bash
npm run start
```

Une fois la commande exécutée, le site web devrait se lancer automatiquement.