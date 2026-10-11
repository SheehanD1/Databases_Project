CREATE DATABASE IF NOT EXISTS internship_tracker;
USE internship_tracker;

CREATE TABLE IF NOT EXISTS companies (
  company_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (company_id),
  UNIQUE KEY (name)
);

CREATE TABLE IF NOT EXISTS statuses (
  status_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (status_id),
  UNIQUE KEY (name)
);

CREATE TABLE IF NOT EXISTS applications (
  application_id INT NOT NULL AUTO_INCREMENT,
  company_id INT NOT NULL,
  status_id INT NOT NULL,
  role_title VARCHAR(150) NOT NULL,
  location VARCHAR(150) DEFAULT NULL,
  application_date DATE NOT NULL,
  job_url VARCHAR(2048) DEFAULT NULL,
  notes TEXT,
  PRIMARY KEY (application_id),
  KEY (company_id),
  KEY (status_id),
  FOREIGN KEY (company_id) REFERENCES companies (company_id),
  FOREIGN KEY (status_id) REFERENCES statuses (status_id)
);
