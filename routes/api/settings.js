"use strict";

const express = require('express');
const router = express.Router();
const sql = require('../../services/sql');
const options = require('../../services/options');
const audit_category = require('../../services/audit_category');
const auth = require('../../services/auth');

const ALLOWED_OPTIONS = ['encryption_session_timeout', 'history_snapshot_time_interval'];

router.get('/', auth.checkApiAuth, async (req, res, next) => {
    const dict = {};

    const settings = await sql.getResults("SELECT opt_name, opt_value FROM options WHERE opt_name IN ("
        + ALLOWED_OPTIONS.map(x => '?').join(",") + ")", ALLOWED_OPTIONS);

    for (const set of settings) {
        dict[set['opt_name']] = set['opt_value'];
    }

    res.send(dict);
});

router.post('/', async (req, res, next) => {
    const body = req.body;

    if (ALLOWED_OPTIONS.includes(body['name'])) {
        const optionName = await options.getOption(body['name']);

        await sql.doInTransaction(async () => {
            await sql.addAudit(audit_category.SETTINGS, req, null, optionName, body['value'], body['name']);

            await options.setOption(body['name'], body['value']);
        });

        res.send({});
    }
    else {
        res.send("not allowed option to set");
    }
});

module.exports = router;