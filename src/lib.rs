use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen};
use serde::{Deserialize, Serialize};

near_sdk::setup_alloc!();

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct Info {
    name: String,
    status: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct UserInfo {
    records: LookupMap<String, Info>,
}

impl Default for UserInfo {
    fn default() -> Self {
        Self {
            records: LookupMap::new(b"r".to_vec()),
        }
    }
}

#[near_bindgen]
impl UserInfo {
    pub fn set_status(&mut self, message: String) {
        let account_id = env::signer_account_id();
        let info = match self.get_info(account_id.clone()) {
            None => Info {
                name: "".to_string(),
                status: message,
            },
            Some(mut i) => {
                i.status = message;
                i
            }
        };
        self.records.insert(&account_id, &info);
    }

    pub fn set_name(&mut self, name: String) {
        let account_id = env::signer_account_id();
        let info = match self.get_info(account_id.clone()) {
            None => Info {
                name: name,
                status: "".to_string(),
            },
            Some(mut i) => {
                i.name = name;
                i
            }
        };
        self.records.insert(&account_id, &info);
    }

    pub fn get_info(&self, account_id: String) -> Option<Info> {
        self.records.get(&account_id)
    }

    pub fn get_status(&self, account_id: String) -> Option<String> {
        match self.get_info(account_id) {
            None => None,
            Some(i) => Option::Some(i.status),
        }
    }

    pub fn get_name(&self, account_id: String) -> Option<String> {
        match self.get_info(account_id) {
            None => None,
            Some(i) => Option::Some(i.name),
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    fn set_get_message() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = UserInfo::default();
        contract.set_status("hello".to_string());
        assert_eq!(
            "hello".to_string(),
            contract.get_status("bob_near".to_string()).unwrap()
        );
    }

    #[test]
    fn set_get_name() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = UserInfo::default();
        contract.set_name("hello".to_string());
        assert_eq!(
            "hello".to_string(),
            contract.get_name("bob_near".to_string()).unwrap()
        );
    }

    #[test]
    fn get_nonexistent_message() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = UserInfo::default();
        assert_eq!(None, contract.get_status("francis.near".to_string()));
    }
}
