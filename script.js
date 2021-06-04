
'use strict';

const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
    module.exports.addLimitLogic();
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
const tf = require('@typeform/api-client')
const typeform = tf.createClient({
    token: 'ASKUkMNsFgtWzjAeDKsfAjCN6z4BHZtq24rhPdGY7pzM'
})

module.exports.addLimitLogic = async (event, context, callback) => {
    console.log(JSON.parse(event.body))
    // extract answer to be limited
    const evt = JSON.parse(event.body)
    const answer = evt.form_response.answers.find(a => a.field.id === 'zstJWPw63RYP')
    const type = answer.type
    const new_value = answer[type]

    const form_definition = await typeform.forms.get({ uid: 'ifm7J4Lw' })
    let { logic = {} } = form_definition

    let new_action = {
        "action": "jump",
        "details": {
            "to": {
                "type": "field",
                "value": 'ff8330f4-a059-42ea-ad19-04e0904f8bbd'
            }
        },
        "condition": {
            "op": "equal",
            "vars": [
                {
                    "type": "field",
                    "value": 'dec3824b-09e3-4e33-89d7-038f04eb7f6d'
                },
                {
                    "type": "constant",
                    "value": new_value
                }
            ]
        }
    }

    //extract logic
    if (logic.length) { //existing logic definition

        // extract logic for this field
        let jump = logic.find(l => l.type === "field" && l.ref === 'dec3824b-09e3-4e33-89d7-038f04eb7f6d')

        // add condition to this jump
        jump.actions.unshift(new_action)
    } else {
        form_definition.logic = {
            type: "field",
            ref: 'zstJWPw63RYP',
            actions: [new_action]
        }
    }

    typeform.forms.update({
        uid: 'ifm7J4Lw',
        override: true,
        data: form_definition
    }).then(response => {
        console.log("RESPONSE", response)
    }).catch(err => {
        console.log('err', err)
    })

    const resp = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Form updated',
            input: event.body,
        }),
    };

    callback(null, resp);
};
