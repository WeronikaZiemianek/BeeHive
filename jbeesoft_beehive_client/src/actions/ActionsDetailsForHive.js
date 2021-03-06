import React, { Component } from 'react';
import './forms/ApiaryList.css';
import { Table, Button } from 'antd';
import { getActionsHistoryForHive } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import ActionDetailsModal  from './ActionDetailsModal';
import { withRouter } from 'react-router-dom';

class ActionsDetailsForHive extends Component {
	_isMounted = false;

	constructor(props) {
		super(props);
		const date = new Date();
		this.loadActionsHistory = this.loadActionsHistory.bind(this);

		this.state = {
			actionsHistory: [],
			isLoading: false,
			date: date,
			oldDate: date,
			error: null
		};
	}

	render() {
		const columns = [{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			render: (text, record) => (
				record.date.substring(0, 10) + '\u00A0\u00A0' + record.date.substring(11, 16)
			),
			sorter: (a, b) => a.date.localeCompare(b.date),
			sortDirections: ['descend', 'ascend']
		}, {
			title: 'Affected hives',
			dataIndex: 'affectedHives',
			key: 'affectedHives',
			render: (text, record) => (
				record.affectedHives.length
			)
		}, {
			title: 'Performed by',
			dataIndex: 'performer',
			key: 'performer',
			render: (text, record) => (
				record.performer.username
			)
		}, {
			title: 'Action name',
			dataIndex: 'actionName',
			key: 'actionName',
			filters: [{
				text: 'Treatment',
				value: 'Treatment',
			}, {
				text: 'Queen Changing',
				value: 'Queen Changing',
			}, {
				text: 'Honey Collecting',
				value: 'Honey Collecting',
			}, {
				text: 'Feeding',
				value: 'Feeding',
			}, {
				text: 'Inspection',
				value: 'Inspection',
			}],
			onFilter: (value, record) => record.actionName.indexOf(value) === 0
		}, {
			title: 'Details',
			dataIndex: 'deleteHive',
			key: 'id',
			render : (text, record) => (
				<Button type="default" onClick={(e) => this.showModal(record, e)}>Details</Button>
			)
		}];

		return(
			<div className="apiary-list">
			{
				!this.state.isLoading && this.state.actionsHistory.length === 0 ? (
					<div className="no-polls-found">
						<h2>You haven't performed any action in this hive.</h2>
					</div>	
				) : null
			}
			{
				!this.state.isLoading && this.state.actionsHistory.length > 0 ? (
					<div>
						<h2>Actions history:</h2>
						<Table rowKey={record => record.id} columns={columns} dataSource={this.state.actionsHistory} />
					</div>
				) : null
			}
			{
				this.state.isLoading ? 
				<LoadingIndicator /> : null
			}
			<ActionDetailsModal
					visible={this.state.visible}
					onCancel={this.handleCancel}
					actionDetails={this.state.actionDetails}
					{...this.props}
				/>
			</div>
		)
	}

	state = {
		visible: false
	};

	showModal = (actionDetails, e) => {
		this.setState({ actionDetails: actionDetails })
		this.setState({ visible: true });
	}

	handleCancel = () => {
		this.setState({ visible: false });
	}

	loadActionsHistory() {
		let promise = getActionsHistoryForHive(this.props.match.params.hiveId);

		if(!promise) {
			return;
		}

		this.setState({isLoading: true});

		promise
		.then(response => {
			if(this._isMounted) {
				this.setState({
					actionsHistory: response,
					isLoading: false
				});
			}
		})
		.catch(error => {
			this.setState({error, isLoading: false});
		});
	}

	componentDidUpdate(nextProps) {
		if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
			this.setState({
				isLoading: false
			});
		}

		if(this.state.date !== this.state.oldDate) {
			this.loadActionsHistory();
			const date = this.state.date;
			this.setState({
				oldDate: date
			})
		}
	}

	componentDidMount() {
		this._isMounted = true;
		this.loadActionsHistory();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}
}

export default withRouter(ActionsDetailsForHive);