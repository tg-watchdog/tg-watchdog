# Contributing Guidelines

We appreciate everyone joining to contribute to this project. However, everyone doesn’t want to see the code being tons of Dark Matter.

Some guidelines help us maintain the project more efficiently. We hope you can read them first and can rule your contribution with these guidelines.

## Code of Conduct
### Respect others’ work
We hope everyone has opportunities to contribute their code to Telegram Watchdog. We think that keeping others’ code is the fundamental rule of collaboration, which also benefits managing the code.

If a feature or code fragment has been accepted and works as expected, we do not suggest you modify it enormously or eradicate it (however, you can try to improve it, and we are welcome). We believe that this rule is the fundamental respect for others’ work.

### Mind the gap between different branches
Telegram Watchdog can be self-deployed, and people usually use the `main` branch to deploy their Telegram Watchdog instance. So, we need to make sure that the `main` branch is the release with fully functional.

If you want to modify the code and merge your work to the primary repository of Telegram Watchdog, please submit your code to the `dev` branch. If you submit your pull requests to the `main` branch of the primary repository, the project manager may modify your pull requests and redirect them to the correct branch or will reject your pull requests directly.

We will talk about the suggested way to prepare to modify the code later.

### Localization contribution in Crowdin
We put the localization management work into a spread project in Crowdin to simplify our work to manage localization files. So, we don’t accept the localization pull requests in the code layer, except the problems can only be resolved in the code.

If you want to improve existing translations, you can head to our [Crowdin project](https://crowdin.com/project/telegram-watchdog). Or join our [official community](https://t.me/tgwatchdog_chat) if you want to suggest a new language.

### Improve this!
Don’t be afraid of such an extended code of conduct part. Just modify it when you see something that can be improved or has an error! We believe that it can improve not only the Telegram Watchdog but also yourself.

## Guides of Modification
### Code modifications
To make sure you can adapt your code to the `dev` branch of the primary repository, we suggest you:

- Keep all branches when you fork the primary repository by de-select the “Copy the main branch only” option
- `checkout` to the `dev` branch after you clone your forked repository.
- Do your work, and submit your pull requests to the `dev` branch of the primary repository after you complete your work.

### Language modifications
We trusteeship our localization work on Crowdin now, so you can head to our [Crowdin project](https://crowdin.com/project/telegram-watchdog) to submit your improvement suggestion. You can check out the documents of Crowdin if you have problems using Crowdin.

Or, join our [official community](https://t.me/tgwatchdog_chat) if you want to suggest a new language.

## Other Contributing Ways
We are pleased that you want to contribute to Telegram Watchdog. Also, you can [sponsor us](https://github.com/sponsors/Astrian) to help Telegram Watchdog keep accessible without cost to everyone.