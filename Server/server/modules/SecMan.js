/*
Diese Datei stellt folgende REST api's zur verfügung:

    POST /api/section
        Input Parameter:
            name -> String
            relevant_tags -> String Array
            parent_id -> ObjectID
            dozent_id -> ObjectID Array
            user -> String //Name of an admin user
            token -> String //Token of an admin user

        Return:
            Jep or Nope

    GET /api/section/id/:sectionid
        Return:
            A section or Nope

    GET /api/section
        Return:
            All sections

    DELETE /api/section
        //Can only delete a Section when this Section hse no children
        Input Parameter:
            section_id -> ObjectID
	        user -> String //Name of an admin user
	        token -> String //Token of an admin user

    GET /api/section/filteredData
        Return:
            Fixed Object
        Input Parameter:
            None

    GET /api/tags
        Return:
            All Tags
        Input Parameter:
            None
*/
const ff = require('./FunnyFunctions')
const logger = require('./Logger')
const SectionDB = require('../DB_Module/DB_Connection_Storage').SectionDB
const PostDB = require("../DB_Module/DB_Connection_Storage").PostDB;
const filteredDataDB = require("../DB_Module/DB_Connection_Storage").filteredDataDB;

module.exports = app => {
    app.post("/api/section", (req, res) => {
        if (req.body.name !== undefined && req.body.relevant_tags !== undefined && req.body.parent_id !== undefined && req.body.dozent_id && req.body.user !== undefined && req.body.token !== undefined) {
            if (ff.checkObjectIdFormat(req.body.parent_id) || req.body.parent_id == null) {
                if (ff.checkObjectIdFormatArray(req.body.dozent_id)) {
                    ff.validateAdminSession(req.body.user, req.body.token).then(admin => {
                        if (admin) {
                            SectionDB.postData({
                                name: req.body.name,
                                relevant_tags: req.body.relevant_tags,
                                dozent_id: req.body.dozent_id,
                                parent_id: req.body.parent_id
                            })
                            res.send("Jep")
                            logger.sendDebug("[SECMAN][POST /api/section] User: " + req.body.user + " added Section: " + req.body.name + ".")
                        } else {
                            res.send("Nope")
                            logger.sendDebug("[SECMAN][POST /api/section] FAILD because Invalid user/token.")
                        }
                    })
                } else {
                    res.send("Nope")
                    logger.sendDebug("[SECMAN][POST /api/section] invalid dozent_id.")
                }
            } else {
                res.send("Nope")
                logger.sendDebug("[SECMAN][POST /api/section] invalid parent_id.")
            }
        } else {
            logger.sendDebug("[SECMAN][POST /api/section] called without required parameters.")
        }
    })

    app.get("/api/section/id/:sectionid", (req, res) => {
        if (req.params.sectionid !== undefined) {
            if (ff.checkObjectIdFormat(req.params.sectionid)) {
                SectionDB.selectData({_id: req.params.sectionid}).then(result => {
                    if (result.length == 1) {
                        res.send(result[0])
                    } else {
                        res.send("Nope")
                        logger.sendDebug('[SECMAN][GET /api/section/id/:sectionid] FAILD to find section with id "' + req.params.sectionid + '".')
                    }
                })
            } else {
                logger.sendDebug("[SECMAN][GET /api/section/id/:sectionid] called without required parameter.")
            }
        } else {
            logger.sendDebug("[SECMAN][GET /api/section/id/:sectionid] called without required parameter.")
        }
    })

    app.get("/api/section", (req, res) => {
        SectionDB.selectData({}).then(result => {
            res.send(result)
        })
    })

    app.delete("/api/section", (req, res) => {
        if (req.body.section_id !== undefined && req.body.user !== undefined && req.body.token !== undefined) {
            if (ff.checkObjectIdFormat(req.body.section_id)) {
                ff.validateAdminSession(req.body.user, req.body.token).then(user => {
                    if (user) {
                        SectionDB.selectData({parent_id: req.body.section_id}).then(childSections => {
                            if (childSections.length == 0) {
                                SectionDB.delData({_id: req.body.section_id})
                                res.send("Jep")
                                logger.sendDebug("[SECMAN][DELETE /api/section] User: " + req.body.user + ' deleted Section: "' + req.body.section_id + '".')
                            } else {
                                res.send("Nope")
                                logger.sendDebug('[SECMAN][DELETE /api/section] FAILD to delete Section: "' + req.body.section_id + '" because it has children.')
                            }
                        })
                    } else {
                        res.send("Nope")
                        logger.sendDebug("[SECMAN][DELETE /api/section] FAILD because Invalid user/token.")
                    }
                })
            } else {
                res.send("Nope")
                logger.sendDebug("[SECMAN][DELETE /api/section] invalid section_id.")
            }
        } else {
            logger.sendDebug("[SECMAN][DELETE /api/section] called without required parameter.")
        }
    })

    app.get("/api/section/filteredData", (req, res) => {
        filteredDataDB.selectData(null).then((data) => {
            if (data.length === 0) {
                res.send("Nope");
                logger.sendDebug("[SECMAN][GET /api/section/filteredData] FAILED!");
            } else {
                res.send(data);
                logger.sendDebug("[SECMAN][GET /api/section/filteredData] Someone called this!");
            }
        });
    });

    app.get("/api/tags", (req, res) => {
        const distinct = (value, index, self) => {
            return self.indexOf(value) === index;
        };
        PostDB.selectData({}).then((postData) => {
            SectionDB.selectData({}).then((sectionData) => {
                let postDataTags = undefined;
                let firstTime = true;
                if (postData.length > 0) {
                    postData.forEach((element) => {
                        if (firstTime) {
                            postDataTags = element["tags"];
                            firstTime = !firstTime;
                        } else
                            postDataTags = postDataTags.concat(element["tags"]);
                    });
                    if (sectionData.length > 0) {
                        let sectionDataTags = undefined;
                        firstTime = !firstTime;
                        sectionData.forEach((element) => {
                            if (firstTime) {
                                sectionDataTags = element["relevant_tags"];
                                firstTime = !firstTime;
                            } else
                                sectionDataTags = sectionDataTags.concat(element["relevant_tags"]);
                        });

                        let unfilteredTags = postDataTags.concat(sectionDataTags);
                        let filteredTags = unfilteredTags.filter(distinct);
                        res.send(filteredTags);
                        logger.sendDebug("[SECMAN][GET /api/tags] Someone got all tags!");
                    } else {
                        logger.sendDebug("[SECMAN][GET /api/tags] sectionData is empty but PostData not!");
                        res.send(postDataTags.filter(distinct));
                    }
                } else {
                    if (sectionData.length > 0) {
                        let sectionDataTags = undefined;
                        firstTime = !firstTime;
                        sectionData.forEach((element) => {
                            if (firstTime) {
                                sectionDataTags = element["relevant_tags"];
                                firstTime = !firstTime;
                            } else
                                sectionDataTags = sectionDataTags.concat(element["relevant_tags"]);
                        });
                        res.send(sectionDataTags.filter(distinct));
                        logger.sendDebug("[SECMAN][GET /api/tags] postData is empty but sectionData not!");
                    } else {
                        res.send("Nope");
                        logger.sendDebug("[SECMAN][GET /api/tags] There are no Tags!");

                    }
                }
            });
        });
    });
}