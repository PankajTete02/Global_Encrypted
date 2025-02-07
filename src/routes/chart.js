const express = require("express");
const router = express.Router();
const chart = require("../controllers/chart");

router.get("/delegate/piechart", chart.findpiechartdelegate);

router.get("/partner/piechart", chart.findpiechartpartner);

router.get("/speaker/piechart", chart.findpiechartspeaker);

router.get("/delegate/piechart/currentDate", chart.findchart_delegateby_currentDate);

router.get("/partner/piechart/currentDate", chart.findchart_partnerby_currentDate);

router.get("/speaker/piechart/currentDate", chart.findchart_speakerby_currentDate);



router.get("/delegate/refrence/piechart", chart.findchart_delegate_refrence_chart);

router.get("/partner/refrence/piechart", chart.findchart_partner_refrence_chart);

router.get("/speaker/refrence/piechart", chart.findchart_speaker_refrence_chart);

module.exports = router;