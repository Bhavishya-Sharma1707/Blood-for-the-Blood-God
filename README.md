# Technoblade Forever

So this is a small fan website about Technoblade. I love his videos, and when I had to choose a creator for my club recruitment project, he was the one I wanted to go with.

I’m a fresher and I already know some Python, but web development is new to me. The idea was to keep this project simple and use it to start learning how a website works.

**Website:** https://technoblade-forever-bhavishya.rightchair2.chatgpt.site

## What’s on the website?

There are two pages:

- **Home:** a short introduction, a section about Dream vs Technoblade, and links to the Potato War videos.
- **Leave a memory:** a form where someone can enter a nickname and a favourite Technoblade moment.

Both pages use the same colours and navigation. The layout also adjusts for smaller screens.

## What happens when someone submits the form?

The message actually gets saved to a database. It isn’t just a button that shows a thank-you message.

1. The visitor enters a nickname and memory.
2. The browser checks the required fields and their lengths.
3. JavaScript sends the details to the backend.
4. The backend checks them again and saves them.
5. The page shows a confirmation after the save succeeds.

If saving fails, the text stays in the form so the visitor can try again.

Messages are private to the site owner. They don’t appear on the page, get emailed, or go to Technoblade’s family. There isn’t an admin page yet.

## What I’m using

| Part | Used for |
| --- | --- |
| HTML | The two pages and the form |
| CSS | Colours, spacing and the mobile layout |
| JavaScript | Sending the form and handling requests on the backend |
| Cloudflare Worker | Running the hosted backend |
| Cloudflare D1 / SQLite | Storing messages |
| Drizzle | Defining the database structure and generating the setup SQL |

There’s no React or Flask in this version. Even though I know Python, this website’s backend uses JavaScript.

## Files in this repo

| File or folder | What it contains |
| --- | --- |
| `pages/index.html` | Home page |
| `pages/community.html` | Memory form page |
| `pages/style.css` | Styles shared by both pages |
| `pages/form.js` | Sends the form to the backend and shows the result |
| `assets/` | The Technoblade image |
| `worker/backend.js` | Routes, validation and the database insert |
| `db/schema.ts` | Database table definition |
| `drizzle/` | SQL migration and its metadata |
| `drizzle.config.ts` | Settings for generating migrations |
| `scripts/build.mjs` | Combines the pages and backend into runnable output |
| `scripts/dev.mjs` | Runs the project locally |
| `scripts/test.mjs` | Checks routes, validation and message storage |
| `package.json` | Project commands and dependencies |
| `package-lock.json` | The dependency versions used by the project |
| `.gitignore` | Files that should stay out of GitHub |

## Run it on your laptop

Use Node.js 24 or newer. Open a terminal in this project folder and run:

```sh
npm ci
npm run build
node scripts/dev.mjs
```

Then open **http://localhost:3000** in your browser.

To stop it, press **Ctrl+C**. After editing the files, stop the server, run `npm run build` again and restart it.

The local version saves messages in `.local/memories.sqlite`. This is separate from the live website’s database, and it isn’t included in this repo. Opening an HTML file directly won’t run the backend.

To run the checks after building:

```sh
npm test
```

The checks use a temporary database, so they don’t change real submissions. They include an intentional database-failure check, which prints a storage error before the final PASS line.

## Hosting

The live version is hosted through Sites and uses a Cloudflare Worker with a D1 database. This repo can run locally without the owner's hosting settings.

Uploading these files to GitHub stores the code; it doesn’t automatically deploy the website or update the live version. GitHub Pages alone won’t run this backend or save the form submissions.

## What I’m learning through this

How HTML and CSS connect, how a form sends data, and what the backend does with that data. I’m also learning why the backend needs to validate input even when the browser already checks it.

I used AI assistance for the initial code and explanations. I’m still working through the code and learning how the different parts connect.

## Things to improve later

- A private admin page to view the messages.
- Better spam protection.
- More Technoblade moments on the home page.

For now, the aim is a small website with two connected pages and a working form.

## Credits

This is an unofficial fan project, not affiliated with Technoblade or his family. The artwork and videos belong to their respective owners.

- [Technoblade’s channel](https://www.youtube.com/@Technoblade)
- [Official website and image source](https://technoblade.com)
- [Original image](https://technoblade.com/cdn/shop/files/TB-LOGO4.png?width=1000)
- [Dream vs Technoblade: duel analysis](https://www.youtube.com/watch?v=5MfhpJOkCKc)
- [The Great Potato War](https://www.youtube.com/watch?v=5qjnDd1rsII)
- [Potato War 2](https://www.youtube.com/watch?v=0PAEqgfAts4)
- [Potato War 3](https://www.youtube.com/watch?v=09CeBwGbCeg)

Technoblade never dies.
