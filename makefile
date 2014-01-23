push: commit
	@git push origin master
commit:
	@git add .
	@git commit -am"auto update `date`" | :
deploy: commit
	@git push heroku master
.PHONY: push commit

