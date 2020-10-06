import React, {useState, useEffect} from 'react';
import {Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Repository from '~/components/Repository';
import api from '~/services/api';
import getRealm from '~/services/realm';

import {Container, Title, Form, Input, Submit, List} from './styles';

const Main = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [repo, setRepo] = useState([]);

  const saveRepo = async (repository) => {
    const data = {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
    };
    const realm = await getRealm();
    realm.write(() => {
      realm.create('Repository', data, 'modified');
    });
    return data;
  };

  const addRepo = async () => {
    try {
      const res = await api.get(`/repos/${input}`);
      await saveRepo(res.data);
      setInput('');
      setError(false);
      Keyboard.dismiss();
    } catch (err) {
      setError(true);
    }
  };

  const refreshRepo = async (repository) => {
    const res = await api.get(`/repos/${repository.fullName}`);
    const data = await saveRepo(res.data);
    setRepo(repo.map((repos) => (repos.id === data.id ? data : repos)));
  };

  useEffect(() => {
    const loadRepo = async () => {
      const realm = await getRealm();
      const data = realm.objects('Repository').sorted('stars', true);
      setRepo(data);
    };

    loadRepo();
  }, []);

  return (
    <Container>
      <Title>Repositórios</Title>
      <Form>
        <Input
          value={input}
          error={error}
          onChangeText={(text) => setInput(text)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Procurar Repositório..."
        />
        <Submit onPress={addRepo}>
          <Icon name="add" size={22} color="#fff" />
        </Submit>
      </Form>
      <List
        keyboardShouldPersistTaps="handle"
        data={repo}
        keyExtractor={(item) => String(item.id)}
        renderItem={({item}) => (
          <Repository data={item} onRefresh={() => refreshRepo(item)} />
        )}
      />
    </Container>
  );
};

export default Main;
