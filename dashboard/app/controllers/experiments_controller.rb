class ExperimentsController < ApplicationController
  before_action :authenticate_user!
  check_authorization
  load_and_authorize_resource
  skip_before_action :verify_authenticity_token

  def enable
    key = params[:key]
    section_id = params[:section_id]
    if section_id
      experiment = Experiment.where(section_id: section_id, name: key).
        where('expiration > ?', DateTime.now).first
      if experiment
        experiment.expiration = DateTime.now + 12.hours
        experiment.save!
      else
        Experiment.create(section_id: section_id, name: key, expiration: DateTime.now + 12.hours)
      end
      return
    end
    experiment = Experiment.active_experiments(current_user).where(name: key).first
    if experiment
      experiment.expiration = DateTime.now + 12.hours
      experiment.save!
    else
      Experiment.create(user: current_user, name: key, expiration: DateTime.now + 12.hours)
    end
  end

  def disable
    key = params[:key]
    section_id = params[:section_id]
    if section_id
      experiment = Experiment.where(section_id: section_id, name: key).
        where('expiration > ?', DateTime.now).first
    else
      experiment = Experiment.active_experiments(current_user).where(name: key).first
    end
    return unless experiment
    experiment.expiration = DateTime.now
    experiment.save!
  end
end
