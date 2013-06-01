#!/bin/bash
git remote -v | grep heroku
if [ $? -ne 0 ]
then
    git remote add heroku 'git@heroku.com:yarravis.git' 
fi
git push heroku master
