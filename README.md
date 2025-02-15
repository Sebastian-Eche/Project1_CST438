## Overview
Guess That Pokemon is a guessing game app that makes the player guess between the Pokemon’s image, cry,  or Pokedex number using the PokeAPI [here](https://pokeapi.co/).

We got styling help for this document from [this guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Introduction

* How was communication managed
  + Communication was managed through Slack and In-Person meetings. If we had trouble or submitted a pull request we would communicate through Slack either by messaging or using their huddle feature. 
* How many stories/issues were initially considered
  + In the very beginning we had less than 10 issues we wanted which were the main things such as have a database, sign up page, and API and other issues that go along with it. As we continued to work more issues presented themselves and currently, we have 17 issues created (15 closed and 2 open)
* How many stories/issues were completed
  + 15 issues were completed while 2 remain open

## Team Retrospective

### Sebastian Echeverria
1. Sebastian’s pull requests are [here](https://github.com/Sebastian-Eche/Project1_CST438/issues?q=state%3Aclosed%20is%3Apr%20author%3ASebastian-Eche%20)
1. Sebastian’s Github issues are [here](https://github.com/Sebastian-Eche/Project1_CST438/issues?q=is%3Aissue%20state%3Aclosed%20author%3ASebastian-Eche)

#### What was your role / which stories did you work on
My main focus of the project was working on the Game Loop. I added various ways that a Player can guess a Pokemon this being by its image, cry, or pokedex number to give it more substance than just an image to guess and to make it more challenging. I also worked on the API setup, creating the Unit Tests to test our API calls and general bug fixes.

+ What was the biggest challenge? 
  +  My biggest challenge was setting up the button to play the Pokemon’s cry audio file. 
+ Why was it a challenge?
  + The package I was using originally didn’t want to work even though I had correctly set up the function to play the audio according to their documentation (which was kind of lacking substance) No matter what changes I did the audio would get played and I was stuck for hours trying to solve the problem
  + How was the challenge addressed?
  + I used online sources such as Stackoverflow and ChatGPT to find a new package to use to play audio and I stumbled upon expo-av working with that I solved the issue in 5 minutes
+ Favorite / most interesting part of this project
  +  Working on the actual game loop of our app, adding the button to make the player guess the Pokemon based on their cry gave it enough pizzazz to make it feel more gamified. With that, adding the Pokedex number and choosing to either show the image, cry, or number randomly and related to the streak. Another change that I came up with later was removing the styling corresponding to the Pokemon’s type when the player had to guess the Pokemon based on the cry or number. I added where the cry can only be played once.
+ If you could do it over, what would you change?
  + Not trying to fix the Web application to work I spent a whole weekend trying to fix it and I never could. I could’ve used that time to add more interesting features to enhance the gameplay.
+ What is the most valuable thing you learned?
  + I need to better document my code especially when others are using it
 
### Hani
1. Carol's pull requests are [here](https://github.com/Jonathan-Welham/Bits-Bots/pulls/@CarolDanvers)
1. Carol's Github issues are [here](https://github.com/FedericoRubino/cst438_project2/issues/created_by/@FedericoRubino)

#### What was your role / which stories did you work on
Carol mostly worked on getting the app to run faster, better, and higher.  She did the best work possible but her contributions were overpowered and not well received by the fans.

+ What was the biggest challenge? 
  + Managing pull requests and merges
+ Why was it a challenge?
  + We were all new to git/github and not everyone followed convention
  + How was the challenge addressed?
  + I went to the TA for help and used ChatGPT and web resources to get more comfortable with git.
+ Favorite / most interesting part of this project
  + Finally getting the IDs from the API calls to store in the ROOM database
+ If you could do it over, what would you change?
  + I would get the ROOM database setup FIRST
+ What is the most valuable thing you learned?
  + Do the work early and document EVERYTHING


## Conclusion

- How successful was the project?
  - The project was a success we set out to at least do the minimum requirements for this project because we were a group of two but we ended up doing a lot more, especially with styling, the favorites page, and the game loop.
- What was the largest victory?
  - Our largest victory would be getting our Github to work by being able to merge our branches to Main because that was an issue we struggled with at the very beginning of the project. Without fixing that early on I don’t know if we would have a complete project as we do now.
- Final assessment of the project
  - All in all, this project was fun to work on, trying to learn how to maneuver around React Native was challenging but doable. Making our guessing game was a fun way to learn a new framework.



