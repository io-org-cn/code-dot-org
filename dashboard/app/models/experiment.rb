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
end
