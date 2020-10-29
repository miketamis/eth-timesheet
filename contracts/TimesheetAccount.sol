// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <=0.7.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TimesheetAccount {

	using SafeMath for uint256;

    ERC20PresetMinterPauser _token;
	address public approver;
	address public token_address;
	string public name;

	enum EntryState { Undefined, Submitted, Approved }

 	struct TimesheetEntry { // Struct
	 	address worker;
        EntryState state;
		uint millisecs;
		uint day;
    }

	constructor() public {
		_token = new ERC20PresetMinterPauser("TimeCoin","TXC");
		token_address = address(_token);
        approver = msg.sender;
		name = "Time Coins Project";
    }

	mapping (bytes32 => TimesheetEntry) timeEntries;

	event TimesheetEntryEvent(address indexed _worker, bytes32 indexed _timesheetId, uint indexed _day, uint _millisecs, string _notes);
	event TimeSheetEntryApproved(address indexed _approver, address indexed _worker,  bytes32 indexed _timesheetId);

	function submitTimeEntry(bytes32 timesheetId, uint day, uint millisecs, string memory notes) public returns(bool success) {
		require(timeEntries[timesheetId].state == EntryState.Undefined, "Id must be unused");
		timeEntries[timesheetId] = TimesheetEntry(msg.sender,  EntryState.Submitted, millisecs, day);
		emit TimesheetEntryEvent(msg.sender, timesheetId, day, millisecs, notes);
		return true;
	}


	function  approveTimeEntry(bytes32 timesheetId) public {
		require(msg.sender == approver, "Must be an approver");
		require(timeEntries[timesheetId].state == EntryState.Submitted, "Entry must be submitted");
		timeEntries[timesheetId].state = EntryState.Approved;
		_token.mint(timeEntries[timesheetId].worker, timeEntries[timesheetId].millisecs.mul(1000000000000000000).div(3600000));
		emit TimeSheetEntryApproved(msg.sender,timeEntries[timesheetId].worker, timesheetId);
	} 

	function getTimeEntry(bytes32 timeEntryId) public view returns(address, EntryState, uint, uint) {
		return (timeEntries[timeEntryId].worker, timeEntries[timeEntryId].state, timeEntries[timeEntryId].millisecs, timeEntries[timeEntryId].day);
	}

	function getTimeEntryState(bytes32 timeEntryId) public view returns(EntryState) {
		return timeEntries[timeEntryId].state;
	}
}
