import {ACCESS_TOKEN, API_BASE_URL} from "../constants";

class Request {
    constructor(url, method, args) {
        this.url = url;
        this.method = method;
        this.body = JSON.stringify(args);
    }

    ok(response, json) {
        return response.ok;
    }

    transform(json) {
        return json;
    }

    build() {
        const headers = new Headers({"Content-Type": "application/json"});
        if(localStorage.getItem(ACCESS_TOKEN))
            headers.append("Authorization",
                "Bearer " + localStorage.getItem(ACCESS_TOKEN));
        return fetch(this.url,
            {headers: headers, method: this.method, body: this.body})
            .then(response =>
                response.json().then(json => {
                    if(!this.ok(response, json)) return Promise.reject(json);
                    return this.transform(json);
                })
            );
    }
}

const ACT_IN_NAME = "name";
const ACT_IN_AMOUNT = "amount";
const ACT_IN_AVERAGE = "averagePrice";
const ACT_IN_TOTAL = "totalPrice";

export const ACT_OUT_ACTION = "act";
export const ACT_OUT_NAME = "itm";
export const ACT_OUT_AMOUNT = "amt";
export const ACT_OUT_AVERAGE = "avg";
export const ACT_OUT_TOTAL = "tot";

class ActionStatRequest extends Request {

    constructor(url, method, args, actionTitle) {
        super(url, method, args);
        this.actionTitle = actionTitle;
    }

    transform(json) {
        const output = [];
        for(let row of super.transform(json))
            output.push({
                act: this.actionTitle,
                itm: row[ACT_IN_NAME],
                amt: row[ACT_IN_AMOUNT],
                avg: row[ACT_IN_AVERAGE],
                tot: row[ACT_IN_TOTAL],
            });
        return output;
    }
}

const CON_IN_CONTR = "contributor";
const CON_IN_CONTR_USERN = "username";
const CON_IN_INSPECT = "incpectionActionNamber";
const CON_IN_FEEDING = "feedingActionNumber";
const CON_IN_TREATMENT = "treatmentActionNumber";
const CON_IN_HONEY = "honeyActionNumber";

export const CON_OUT_CONTR = "con";
export const CON_OUT_INSPECT = "ins";
export const CON_OUT_FEEDING = "fed";
export const CON_OUT_TREATMENT = "trt";
export const CON_OUT_HONEY = "hon";
/**
 * ## output:
 * * con : _String_ contributor username;
 * * ins : _String_ contributor's inspections count;
 * * fed : _String_ contributor's feedings count;
 * * trt : _String_ contributor's treatments count;
 * * hon : _String_ contributor's honey collections count.
 */
class ContributorStatRequest extends Request {

    transform(json) {
        const output = [];
        for(let row of super.transform(json))
            output.push({
                con: row[CON_IN_CONTR][CON_IN_CONTR_USERN],
                ins: row[CON_IN_INSPECT],
                fed: row[CON_IN_FEEDING],
                trt: row[CON_IN_TREATMENT],
                hon: row[CON_IN_HONEY],
            });
        return output;
    }
}

/**
 * @param apiId {number}
 * @param startDate {string}
 * @param endDate {string}
 * @param hiveIds {Array<number>}
 * @returns {Promise}
 */
export function getFeedingStats(apiId, startDate, endDate, hiveIds = []) {
    const url = API_BASE_URL + "/statistics/feeding/" + apiId;
    const args = {beginningDate: startDate, endDate: endDate, hiveId: hiveIds};
    return new ActionStatRequest(url, "POST", args, "Feeding").build();
}

/**
 * @param apiId {number}
 * @param startDate {string}
 * @param endDate {string}
 * @param hiveIds {Array<number>}
 * @returns {Promise}
 */
export function getHoneyStats(apiId, startDate, endDate, hiveIds = []) {
    const url = API_BASE_URL + "/statistics/honey/" + apiId;
    const args = {beginningDate: startDate, endDate: endDate, hiveId: hiveIds};
    return new ActionStatRequest(url, "POST", args, "Honey").build();
}

/**
 * @param apiId {number}
 * @param startDate {string}
 * @param endDate {string}
 * @param hiveIds {Array<number>}
 * @returns {Promise}
 */
export function getTreatmentStats(apiId, startDate, endDate, hiveIds = []) {
    const url = API_BASE_URL + "/statistics/treatment/" + apiId;
    const args = {beginningDate: startDate, endDate: endDate, hiveId: hiveIds};
    return new ActionStatRequest(url, "POST", args, "Treatment").build();
}

/**
 * @param apiId {number}
 * @param startDate {string}
 * @param endDate {string}
 * @returns {Promise}
 */
export function getContributorStats(apiId, startDate, endDate) {
    const url = API_BASE_URL + "/statistics/contributor/" + apiId;
    const args = {beginningDate: startDate, endDate: endDate};
    return new ContributorStatRequest(url, "POST", args).build();
}