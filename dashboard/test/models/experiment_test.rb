require 'test_helper'

class ExperimentTest < ActiveSupport::TestCase
  test "no active experiments" do
    user = create :user
    assert_empty user.active_experiments
  end

  test "user-specific experiment" do
    user = create :user
    experiment = create :experiment, user: user
    assert_equal [experiment], user.active_experiments
  end

  test "section-specific experiment" do
    user = create :user
    section = create :section, script: Script.twenty_hour_script
    section.add_student user
    experiment = create :experiment, user: nil, section: section

    assert_equal [experiment], user.active_experiments
  end

  test "ignore expired user experiment" do
    user = create :user
    create :experiment, user: user, expiration: DateTime.now - 1.hour
    assert_empty user.active_experiments
  end

  test "ignore expired section-specific experiment" do
    user = create :user
    section = create :section, script: Script.twenty_hour_script
    section.add_student user
    create :experiment,
      user: nil,
      section: section,
      expiration: DateTime.now - 1.hour

    assert_empty user.active_experiments
  end

  test "ignore other users' experiments" do
    user1 = create :user
    user2 = create :user
    create :experiment, user: user1
    assert_empty user2.active_experiments
  end

  test "ignore other sections' experiments" do
    user = create :user
    section1 = create :section, script: Script.twenty_hour_script
    section2 = create :section, script: Script.hoc_2014_script
    section1.add_student user
    create :experiment, user: nil, section: section2

    assert_empty user.active_experiments
  end

  test "experiment without a user or section is invalid" do
    experiment = build :experiment, user: nil, section: nil
    refute experiment.valid?
  end

  test "experiment without both a user and section is invalid" do
    experiment = build :experiment, user: create(:user), section: create(:section)
    refute experiment.valid?
  end
end
