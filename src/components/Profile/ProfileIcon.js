import React, { Component } from "react";
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";

class ProfileIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
        };
    }

    toggle = () => {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    };

    render() {
        return (
            <div className="pa4 tc">
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle data-toggle="dropdown" tag="span">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            className="br-100 ba h3 w3 dib"
                            alt="avatar"
                        />
                    </DropdownToggle>
                    <DropdownMenu
                        right
                        className="b--transparent shadow-5"
                        style={{
                            marginTop: "20px",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "5px",
                        }}
                    >
                        <DropdownItem onClick={this.props.toggleModal}>
                            View Profile
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => this.props.onRouteChange("signin")}
                        >
                            Sign Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}

export default ProfileIcon;
