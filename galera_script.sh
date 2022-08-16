#!/bin/bash
echo "adding the Galera repository key with the apt-key command..."
apt-key adv --keyserver keyserver.ubuntu.com --recv BC19DDBA
echo -e "\e[32mDone!\e[0m"
echo "adding repositories..."
echo -e "deb http://releases.galeracluster.com/mysql-wsrep-5.7/ubuntu bionic main\ndeb http://releases.galeracluster.com/galera-3/ubuntu bionic main" > /etc/apt/sources.list.d/galera.list
echo -e "\e[32mDone!\e[0m"
echo "giving preference to Codership repositories..."
echo -e "# Prefer Codership repository\nPackage: *\nPin: origin releases.galeracluster.com\nPin-Priority: 1001" > /etc/apt/preferences.d/galera.pref
echo -e "\e[32mDone!\e[0m"
echo "updating packages"
apt update
echo -e "\e[32mDone!\e[0m"
echo "Installing mysql and galera"
apt install galera-3 mysql-wsrep-5.7
echo -e "\e[32mDone!\e[0m"
echo "Disabling AppArmor "
ln -s /etc/apparmor.d/usr.sbin.mysqld /etc/apparmor.d/disable/
apparmor_parser -R /etc/apparmor.d/usr.sbin.mysqld
echo -e "\e[32mDone!\e[0m"
echo "Enter machine ip"
read -p 'node_1: ' node_1
read -p 'node_2: ' node_2
read -p 'node_3: ' node_3
read -p 'this node ip: ' this_node_ip
read -p 'this node name: ' this_node_name
echo -e "[mysqld]\nbinlog_format=ROW\ndefault-storage-engine=innodb\ninnodb_autoinc_lock_mode=2\nbind-address=0.0.0.0\n# Galera Provider Configuration\nwsrep_on=ON\nwsrep_provider=/usr/lib/galera/libgalera_smm.so\n# Galera Cluster Configuration\nwsrep_cluster_name=\"my_cluster\"\nwsrep_cluster_address=\"gcomm://$node_1,$node_2,$node_3\"\n# Galera Synchronization Configuration\nwsrep_sst_method=rsync\n# Galera Node Configuration\nwsrep_node_address=\"$this_node_ip\"\nwsrep_node_name=\"$this_node_name\"" >/etc/mysql/conf.d/galera.cnf

echo "Opening firewall... "
ufw enable
ufw allow 22
ufw allow 3306,4567,4568,4444/tcp
ufw allow 4567/udp
ufw status
echo -e "\e[32mDone!\e[0m"
echo "Enabliing mysql....."
systemctl enable mysql
echo -e "\e[32mDone!\e[0m"
select choice in "bootstrap" "start"
do
  echo "starting mysql cluster using: $choice"
  if [ $choice = "bootstrap" ] ; then
        mysqld_bootstrap
  else
        systemctl start mysql
  fi
  mysql -u root -p -e "SHOW STATUS LIKE 'wsrep_cluster_size'" 
  break  
done
