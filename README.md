# Git project


Before starting to dev, don't forget to ```git pull origin main```


## Installation procedure

Clone the project with :

### HTTPS : ```git clone https://github.com/MaxouZouzouAlou/enssatWebFront.git```

### SSH : ```git clone git@github.com:MaxouZouzouAlou/enssatWebFront.git```

## Branches


### Branch guidelines
Branch names start with the following names :
- ```feat/...```
- ```fix/...```
- ```delete/...```
- ```docs/...```

To create a new branch : ```git checkout -b <branch_name>```

To switch to a created branch : ```git checkout <branch_name>```


### Commit practices
Merging / pushing to main requires verification.

Commits should start with the following names :
- ```feat/...```
- ```fix/...```
- ```delete/...```
- ```docs/...```

#### To push your work
```
git add .   (adds every file not present in the .gitignore file)
or
git add path/to/file.png   (adds a specific file)

git commit -m "Commit description message"

git push origin <branch_name>   (main one)
or
git push <remote_branch> <current_branch>   (push to another branch)
```

If this is the first push on a branch : ```git push --set-upstream origin <branch_name>```


### Stashing
If you have unsaved changes and want to do actions on another branch, stash : ```git stash push -m "description message"```

To see all available stashes : ```git stash list```
To see a specific stash : ```git stash show stash@{<stash_number>}```

To restore stashes :
```
git stash pop   (restores then delete)
or
git stash apply stash@{<stash_number>}
```

To make a stash as a new branch : ```git stash branch <branch_name> ```


### Merging

Before merging the contents of your branch, commit them using what's described in the ["push your work"](#to-push-your-work-) part.

Once that's done, merge : ```git merge <current_branch>```

To abord a merge : ```git merge --abort```


---



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### Auth configuration

The frontend calls the backend auth API with credentials enabled. By default,
the frontend runs on `http://localhost:3000` and calls the backend on
`http://localhost:49161`:

```bash
PORT=3000
REACT_APP_API_URL=http://localhost:49161
REACT_APP_ENABLE_GOOGLE_AUTH=false
```

Email/password registration redirects users through email verification before
login. Professional registration collects the company address
(`adresse_ligne`, `code_postal`, `ville`); the user personal address is not
collected during account creation.

Set `REACT_APP_ENABLE_GOOGLE_AUTH=true` only when the backend also has
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` configured.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
