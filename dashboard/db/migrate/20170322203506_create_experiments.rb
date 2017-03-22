class CreateExperiments < ActiveRecord::Migration[5.0]
  def change
    create_table :experiments do |t|
      t.string :name
      t.integer :user_id, index: true
      t.integer :section_id, index: true
      t.datetime :expiration

      t.timestamps
    end
  end
end
