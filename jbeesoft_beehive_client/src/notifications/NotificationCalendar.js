import React from "react"
import {getNotifications} from "../util/APIUtils"
import {Calendar, Modal, notification} from "antd"
import LoadingIndicator from "../common/LoadingIndicator";
import ErrorIndicator from "../common/ErrorIndicator";
import moment from "moment";
import "./NotificationCalendar.css";
import {WrappedNotifCreateForm} from "./NotifCreateForm";
import {NotifItem} from "./NotifItem";

const EMPTY_JSX = ("");

/**
 * ## props:
 * * currentUser : ___user___;
 *
 * ## user:
 * * id : _Integer_;
 * * username : _String_;
 * * name : _String_;
 * * email : _String_;
 */
export class NotificationCalendar extends React.Component {

    constructor(props) {
        super(props);
        this.dateCellRender = this.dateCellRender.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.refreshNotifs = this.refreshNotifs.bind(this);
        this.dismiss = this.dismiss.bind(this);
        this.handleNotifsChange = this.handleNotifsChange.bind(this);
        this.cellJSXfor = this.cellJSXfor.bind(this);
        this.modalJSXfor = this.modalJSXfor.bind(this);

        this.state = {
            loading: true,
            error: false,
            visible: false,
            notifsJSON: [],
            selectedDate: moment().format("YYYY-MM-DD"),
        };
    }

    handleNotifsChange(success, action, notif) {
        let message = notif.title;
        let description = "Notification " + action + " - ";
        description += success? "success" : "failure";
        let dict = {message: message, description: description};
        if(!success)
            notification.error(dict);
        else {
            notification.success(dict);
            this.refreshNotifs();
        }
    }

    refreshNotifs() {
        let parent = this;
        getNotifications().then(json => {
            parent.setState({
                loading: false,
                notifsJSON: json,
            });
        }).catch(errors => {
            parent.setState({
                loading: false,
                error: true,
            });
        });
    }

    componentDidMount() {
        this.refreshNotifs();
    }

    cellJSXfor(dateJSON) {
        let JSXlist = [];
        let idx = 0;
        dateJSON.forEach(notif => {
            if(!notif.isRealize)
                JSXlist.push((
                    <h6 key={idx++} className={"text-warning"}>
                        {notif.title}
                    </h6>
                ));
        });
        dateJSON.forEach(notif => {
            if(notif.isRealize)
                JSXlist.push((
                    <h6 key={idx++} className={"text-checked"}>
                        {notif.title}
                    </h6>
                ));
        });

        return (
            <div className={"match-parent"}>
                {JSXlist}
            </div>
        );
    }

    modalJSXfor(dateJSON) {
        let notifItemsJSX = this.notifItemsJSXfor(dateJSON);
        return (
            <Modal visible={this.state.visible}
                onCancel={this.dismiss} onOk={this.dismiss}>
                <h1>{this.state.selectedDate}</h1>
                {notifItemsJSX}
                <WrappedNotifCreateForm
                    onNotifsChange={this.handleNotifsChange}
                    date={this.state.selectedDate}
                    username={this.props.currentUser.username}
                    userId={this.props.currentUser.id}/>
            </Modal>
        );
    }

    notifItemsJSXfor(dateJSON) {
        let notifItemsJSX = [];
        let parent = this;
        let i = 0;
        for(let date in dateJSON) {
            notifItemsJSX.push((
                <NotifItem key={i} notif={dateJSON[date]}
                    userId={this.props.currentUser.id}
                    onNotifsChange={parent.handleNotifsChange}/>
            ));
            i++;
        }
        return (
            <div>{notifItemsJSX}</div>
        );
    }

    dateCellRender(date) {
        date = date.format("YYYY-MM-DD");
        if(this.state.loading)
            return (<LoadingIndicator/>);
        if(this.state.error)
            return (<ErrorIndicator/>);
        return this.state.notifsJSON[date]?
            this.cellJSXfor(this.state.notifsJSON[date]) : EMPTY_JSX;
    }

    onSelect(date) {
        date = date.format("YYYY-MM-DD");
        this.setState({
            visible: true,
            selectedDate: date,
        });
    }


    dismiss() {
        this.setState({
            visible: false,
        });
    }

    render() {
        let modalJSX = this.state.notifsJSON[this.state.selectedDate]?
            this.modalJSXfor(this.state.notifsJSON[this.state.selectedDate]) :
            this.modalJSXfor([]);

        return (
            <div>
                <Calendar dateCellRender={this.dateCellRender}
                    onSelect={this.onSelect}/>
                {modalJSX}
            </div>
        );
    }

}

