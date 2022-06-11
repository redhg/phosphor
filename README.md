# PHOSPHOR
### A retro terminal simulator for tabletop role-playing games

[Click here to skip the preamble and jump straight to Getting Started](#getting-started).

## Inspiration
The inspiration for this little app was [Quadra's post](https://www.traaa.sh/the-ypsilon-14-terminal) about an ersatz terminal for [The Haunting of Ypsilon 14](https://www.mothershiprpg.com/pamphlet-adventures/#The_Haunting_Of_Ypsilon_14), a module written by D G Chapman for [the Mothership tabletop roleplaying game](https://www.mothershiprpg.com/).

Because of that (and because I was asked on [the Mothership Discord](https://discord.gg/uuvxG29)), I've made the JSON content that I used when I ran the module available in this repo. To use it, just load `ypsilon14.json` instead of `sample.json` at the top of `src/components/Phosphor/index.tsx` (line 22 as of this writing).

Or you can skip doing it yourself and instead just check out [the Ypsilon 14 terminal in action](https://redhg.com/ypsilon14/).

## An important note about this project

 I will not be accepting pull requests, nor will I be paying attention to the issues. I suggest you fork this repo if you want to make any public changes. It's all just for fun; noodling around without a particular goal.

That being said, I'd love to see what *you* can do with my garabge project, so send me an email at **phosphor {at} redhg {dot} com** to let me know how you've expanded it!

Suggested features:
* Sound effects;
* Autoscrolling or auto-pause/press space to continue at end of screen;
* Asset preloader;
* JSON uploading & parsing;
* Routing support;
* Dynamic themes -- I've added some colour values in `_colors.scss` but they don't work yet;
* Links, Prompts, Images, and Teletype support *within* Dialogs.

---

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To install this project, open a terminal window and `cd` into the repo's directory, then run
### `npm install`.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

**Note:** as of June 11, 2022, there are absolutely no tests in this project and that's unlikely to change.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
