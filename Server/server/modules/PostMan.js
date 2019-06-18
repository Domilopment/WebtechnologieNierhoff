/*
Diese Datei stellt folgende REST api's zur verfügung:

    POST /api/post
        Input Parameter:
            title -> String
            link -> String
            text -> String
            post_date -> Date ("2019.12.11" seams to work (ask Metin for details))
            tags -> String Array
            author -> String (Name of the User)
            section -> String (ID of the Section)
            token -> String (Valid login token)
        Return:
            Jep or Nope

    GET /api/post/id/:postid
        Return:
            One Post as JSON or Nope

    GET /api/post/search/:search
        Return:
            Array of Posts

    DELETE /api/post
        Input Parameter:
            postid
            user
            tokrn
        Return:
            Jep or Nope

    GET /api/post/newest
        Return:
            Newest videos as JSON Array.

*/
const ff = require('./FunnyFunctions')
const Config = require('../config')
const logger = require('./Logger')
const PostDB = require('../DB_Module/DB_Connection_Storage').PostDB
const UserDB = require('../DB_Module/DB_Connection_Storage').UserDB

module.exports = app => {
    app.post("/api/post", (req, res) => {
        if(req.body.title !== undefined &&
            req.body.link !== undefined &&
            req.body.text !== undefined &&
            req.body.post_date !== undefined &&
            req.body.tags !== undefined &&
            req.body.author !== undefined && //Must be the User Name not the ID
            req.body.section !== undefined &&//Must be the ID not the Name
            req.body.token !== undefined) {
            if(ff.checkObjectIdFormat(req.body.section)) {
                ff.validateDozentSession(req.body.author, req.body.token).then(result => {
                    if (result) {
                        if (isNaN(new Date(req.body.post_date).getTime())) {
                            res.send("Nope")
                            logger.sendDebug("[POSTMAN][POST /api/post] Trying to add Invalid Date.")
                        } else {
                            PostDB.postData({
                                title: req.body.title,
                                link: req.body.link,
                                text: req.body.text,
                                post_date: req.body.post_date,
                                tags: req.body.tags,
                                author_id: result._id,
                                section_id: req.body.section
                            })
                            res.send("Jep")
                            logger.sendDebug("[POSTMAN][POST /api/post] User " + result.name + " added a post.")
                        }
                    } else {
                        res.send("Nope")
                        logger.sendDebug("[POSTMAN][POST /api/post] FAILD because Invalid user/token.")
                    }
                })
            } else {
                res.send("Nope")
                logger.sendDebug("[POSTMAN][POST /api/post] invalid section.")
            }
        } else {
            logger.sendDebug("[POSTMAN][POST /api/post] called without required parameters.")
        }
    })

    app.get("/api/post/id/:postid", (req, res) => {
        if(req.params.postid !== undefined) {
            if(ff.checkObjectIdFormat(req.params.postid)) {
                PostDB.selectData({_id: req.params.postid}).then(post => {
                    if (post.length == 1) {
                        appendAuthorToPost(post[0]).then(result => {
                            res.send(result)
                        })
                    } else {
                        res.send("Nope")
                        logger.sendDebug('[POSTMAN][GET /api/post/id/:postid] FAILD to find post with id "' + req.params.postid + '".')
                    }
                })
            } else {
                res.send("Nope")
                logger.sendDebug("[POSTMAN][GET /api/post/id/:postid] invalid postid.")
            }
        } else {
            logger.sendDebug("[POSTMAN][GET /api/post/id/:postid] called without required parameter.")
        }
    })

    app.get("/api/post/search/:search", (req, res) => {
        if(req.params.search !== undefined) {
            PostDB.selectData({title: new RegExp(req.params.search, 'i')}).then(postsTitle => {
                PostDB.selectData({tags: req.params.search}).then(postsTag => {
                    let response = postsTitle.concat(postsTag)
                    response = filterDouble(response)
                    let pro = []
                    response.forEach(ele => {
                        pro.push(appendAuthorToPost(ele))
                    })
                    Promise.all(pro).then(result => {
                        res.send(result)
                    })
                })
            })
        } else {
            logger.sendDebug("[POSTMAN][GET /api/post/search/:search] called without required parameter.")
        }
    })

    app.get("/api/post/newest", (req, res) => {
        PostDB.selectData({}).then(posts => {
            posts.sort((a, b) => {
                return new Date(b.post_date) - new Date(a.post_date)
            })
            let newestPosts = posts.slice(0, Config.FEED_LENGTH)
            let pro = []
            newestPosts.forEach(ele => {
                pro.push(appendAuthorToPost(ele))
            })
            Promise.all(pro).then(newestPostsWithAuthor => {
                res.send(newestPostsWithAuthor)
            })
        })
    })

    app.get("/api/posts", (req, res) => {
        PostDB.selectData({}).then(posts => {
            posts.sort((a, b) => {
                return new Date(a.post_date) - new Date(b.post_date)
            })
            let newestPosts = posts.slice(0, 9001)
            let pro = []
            newestPosts.forEach(ele => {
                pro.push(appendAuthorToPost(ele))
            })
            Promise.all(pro).then(newestPostsWithAuthor => {
                res.send(newestPostsWithAuthor)
            })
        })
    })

    app.delete("/api/post", (req, res) => {
        if(req.body.postid !== undefined && req.body.user !== undefined && req.body.token !== undefined) {
            if(ff.checkObjectIdFormat(req.body.postid)) {
                ff.validateAdminSession(req.body.user, req.body.token).then(adminUser => {
                    if (adminUser) {
                        //User is admin
                        PostDB.selectData({_id: req.body.postid}).then(post => {
                            if (post.length == 1) {
                                //Post exists
                                PostDB.delData({_id: post[0]._id})
                                res.send("Jep")
                                logger.sendDebug('[POSTMAN][DELETE /api/post] Deleted post "' + req.body.postid + '".')
                            } else {
                                res.send("Nope")
                                logger.sendDebug("[POSTMAN][DELETE /api/post] FAILD Post with id: \"" + req.body.postid + "\" does not exists.")
                            }
                        })
                    } else {
                        ff.validateDozentSession(req.body.user, req.body.token).then(dozentUser => {
                            if (dozentUser) {
                                //User is Dozent
                                PostDB.selectData({_id: req.body.postid}).then(post => {
                                    if (post.length == 1) {
                                        //Post exists
                                        UserDB.selectData({name: req.body.user}).then(user => {
                                            if (user[0]._id.toString() === post[0].author_id.toString()) {
                                                //User is the author
                                                PostDB.delData({_id: post[0]._id})
                                                res.send("Jep")
                                                logger.sendDebug('[POSTMAN][DELETE /api/post] Deleted post "' + req.body.postid + '".')
                                            } else {
                                                res.send("Nope")
                                                logger.sendDebug('[POSTMAN][DELETE /api/post] FAILD User "' + req.body.user + '" is not the author.')
                                            }
                                        })
                                    } else {
                                        res.send("Nope")
                                        logger.sendDebug("[POSTMAN][DELETE /api/post] FAILD Post with id: \"" + req.body.postid + "\" does not exists.")
                                    }
                                })
                            } else {
                                res.send("Nope")
                                logger.sendDebug("[POSTMAN][DELETE /api/post] FAILD because Invalid user/token.")
                            }
                        })
                    }
                })
            } else {
                res.send("Nope")
                logger.sendDebug("[POSTMAN][DELETE /api/post] invalid postid.")
            }
        } else {
            logger.sendDebug("[POSTMAN][DELETE /api/post] called without required parameter.")
        }
    })

}

let filterDouble = (array) => {
    let counter = 0

    for(let i1 = 0; i1<array.length; i1++) {
        for(let i2 = 0; i2<array.length; i2++) {
            if(array[i1]._id.toString() === array[i2]._id.toString()) {
                counter++
            }
            if(counter >= 2) {
                array[i2].text = "---------MarkForDelete---------"
                counter--
            }
        }
        counter = 0
    }

    array = array.filter((ele) => {
        if(ele.text === "---------MarkForDelete---------") {
            return false
        } else {
            return true
        }
    })

    return array
}

let appendAuthorToPost = (post) => {
    return UserDB.selectData({_id: post.author_id}).then(author => {
        let result = JSON.parse(JSON.stringify(post))
        if(author.length === 1) {
            result.author_name = author[0].name
            return result
        } else {
            result.author_name = "Unknown"
            return result
        }
    })
}