import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import HeadingBanner from '../HeadingBanner';
import TeacherCourses from './TeacherCourses';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import color from "../../util/color";
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import i18n from "@cdo/locale";

const styles = {
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: 940
  },
  spacer: {
    height: 50,
    width: 940,
    float: 'left',
    color: color.white
  }
};

/**
 * Though named Courses, this component represents a collection of courses and/or
 * scripts. These come from sections the user is in, or from courses/scripts they
 * have recently made progress in.
 * The component is only used on the /courses page, and also does some additional
 * DOM manipulation on mount.
 */
const Courses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    isEnglish: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    isSignedOut: React.PropTypes.bool.isRequired,
    linesCount: React.PropTypes.string.isRequired,
    studentsCount: React.PropTypes.string.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    showInitialTips: React.PropTypes.bool.isRequired,
    userId: React.PropTypes.number
  },

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    if (this.props.isEnglish && this.props.isTeacher) {
      $('.courseexplorer').appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer)).show();
      $('.tools').appendTo(ReactDOM.findDOMNode(this.refs.toolExplorer)).show();
    } else {
      $('#user_hero').appendTo(ReactDOM.findDOMNode(this.refs.userHero)).show();
      $('.all-courses').appendTo(ReactDOM.findDOMNode(this.refs.allCourses)).show();
    }
  },

  render() {
    const { courses, isEnglish, isTeacher, codeOrgUrlPrefix, isSignedOut, userId, showInitialTips } = this.props;

    return (
      <div>
        <HeadingBanner
          headingText={i18n.courses()}
          subHeadingText={i18n.coursesHeadingSubText(
            {linesCount: this.props.linesCount, studentsCount: this.props.studentsCount}
          )}
          showCreateAccount={isSignedOut}
          description={i18n.coursesHeadingDescription()}
        />

        {!isTeacher && (
          <ProtectedStatefulDiv
            style={styles.userHero}
            ref="userHero"
          />
        )}

        {courses && courses.length > 0 && (
          <RecentCoursesCollapsible
            courses={courses}
            showAllCoursesLink={false}
            heading={i18n.myCourses()}
            isTeacher={isTeacher}
          />
        )}

        {isEnglish && isTeacher && (
          <div>
            <UiTips
              userId={userId}
              tipId={"teacher_courses"}
              showInitialTips={showInitialTips}
              tips={
                [
                  {
                    type: "initial",
                    position: {top: 0, left: 0, position: "relative"},
                    text: i18n.coursesUiTipsTeacherCourses(),
                    arrowDirection: "down",
                    scrollTo: ".courseexplorer"
                  }
                ]}
            />

            <div>
              <div style={styles.heading}>
                {i18n.courseExplorerHeading()}
              </div>
              <div>
                {i18n.courseExplorerDescription()}
              </div>
              <ProtectedStatefulDiv ref="courseExplorer"/>
              <div style={styles.spacer}>.</div>

              <br/>
              <br/>
              <TeacherCourses codeOrgUrlPrefix={codeOrgUrlPrefix}/>

              {false && (
                <div>
                  <div style={styles.heading}>
                    {i18n.toolExplorerHeading()}
                  </div>
                  <div>
                    {i18n.toolExplorerDescription()}
                  </div>
                  <ProtectedStatefulDiv ref="toolExplorer"/>
                </div>
              )}
            </div>
          </div>
        )}

        {!(isEnglish && isTeacher) && (
          <div>
            <ProtectedStatefulDiv ref="allCourses"/>
          </div>
        )}

        {!isTeacher && !isSignedOut && (
          <ProgressButton text={i18n.viewMyProjects()} href="/projects" color={ProgressButton.ButtonColor.orange}/>
        )}
      </div>
    );
  }
});

export default Courses;
