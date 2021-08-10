import { Drawer, Divider, Col, Row } from "antd";

const DescriptionItem = ({ title, content }) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{title}:</p>
    {content}
  </div>
);

const DrawerDocument = ({ data }) => {
  return (
    <Drawer
      width={640}
      placement="right"
      // onClose={this.onClose}
      // visible={this.state.visible}
    >
      <p
        className="site-description-item-profile-p"
        style={{ marginBottom: 24 }}
      >
        User Profile
      </p>
      <p className="site-description-item-profile-p">Personal</p>
      <Row>
        <Col span={12}>
          <DescriptionItem title="Full Name" content="Lily" />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Account" content="AntDesign@example.com" />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title="City" content="HangZhou" />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Country" content="China🇨🇳" />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title="Birthday" content="February 2,1900" />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Website" content="-" />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <DescriptionItem
            title="Message"
            content="Make things as simple as possible but no simpler."
          />
        </Col>
      </Row>
      {/* <Divider /> */}
    </Drawer>
  );
};

export default DrawerDocument;
