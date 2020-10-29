// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <=0.7.0;

import "./GenericProject.sol";

contract GenericProjectFactory {
    event NewProject(address indexed _approver, string _name, address _projectAddress);
    function createProject(string memory name) public {
        GenericProject project = new GenericProject(msg.sender, name);
        emit NewProject(msg.sender, name, address(project));
    }
}