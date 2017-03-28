# == Schema Information
#
# Table name: experiments
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  user_id    :integer
#  section_id :integer
#  expiration :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_experiments_on_section_id  (section_id)
#  index_experiments_on_user_id     (user_id)
#

class Experiment < ActiveRecord::Base
  belongs_to :user
  belongs_to :section
  validate :set_for_either_user_or_section

  def self.active_experiments(user, script = nil)
    section = user.sections_as_student.where(script: script) if script
    experiments = where(user: user)
    experiments = experiments.or(where(section: section)) if section
    experiments.where('expiration > ?', DateTime.now)
  end

  def set_for_either_user_or_section
    unless section_id || user_id
      errors.add(:base, message: "experiment must be set for a user or section")
    end
    if section_id && user_id
      errors.add(:base, message: "experiment cannot be set for both a user and section")
    end
  end
end
